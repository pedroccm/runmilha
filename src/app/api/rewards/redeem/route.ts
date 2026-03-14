import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { rewardId } = await req.json();

  if (!rewardId) {
    return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch reward
  const { data: reward } = await supabase
    .from("rm_rewards")
    .select("*")
    .eq("id", rewardId)
    .single();

  if (!reward) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  if (reward.remaining_stock !== null && reward.remaining_stock <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 409 });
  }

  // Fetch wallet
  const { data: wallet } = await supabase
    .from("rm_wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet || wallet.balance < reward.cost_milhas) {
    return NextResponse.json({ error: "Not enough milhas" }, { status: 402 });
  }

  const newBalance = wallet.balance - reward.cost_milhas;

  // Generate promo code
  const code = `${reward.promo_code_prefix || "RM"}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  // Deduct from wallet
  const { error: walletError } = await supabase
    .from("rm_wallets")
    .update({
      balance: newBalance,
      total_spent: wallet.total_spent + reward.cost_milhas,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id)
    .eq("balance", wallet.balance); // optimistic lock: abort if balance changed

  if (walletError) {
    return NextResponse.json(
      { error: "Balance changed, please try again" },
      { status: 409 }
    );
  }

  // Create transaction
  const { data: transaction, error: txError } = await supabase
    .from("rm_transactions")
    .insert({
      user_id: user.id,
      wallet_id: wallet.id,
      type: "spend",
      amount: -reward.cost_milhas,
      balance_after: newBalance,
      description: `Redeemed: ${reward.title}`,
      reference_type: "redemption",
    })
    .select()
    .single();

  if (txError) {
    // Rollback wallet deduction
    await supabase
      .from("rm_wallets")
      .update({ balance: wallet.balance, total_spent: wallet.total_spent, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }

  // Create redemption
  const { error: redemptionError } = await supabase
    .from("rm_redemptions")
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      transaction_id: transaction.id,
      promo_code: code,
      status: "active",
      expires_at: reward.valid_until ?? null,
    });

  if (redemptionError) {
    // Rollback wallet + transaction
    await supabase.from("rm_wallets").update({ balance: wallet.balance, total_spent: wallet.total_spent, updated_at: new Date().toISOString() }).eq("id", wallet.id);
    await supabase.from("rm_transactions").delete().eq("id", transaction.id);
    return NextResponse.json({ error: "Failed to create redemption" }, { status: 500 });
  }

  // Decrease stock
  if (reward.remaining_stock !== null) {
    await supabase
      .from("rm_rewards")
      .update({ remaining_stock: reward.remaining_stock - 1 })
      .eq("id", rewardId);
  }

  return NextResponse.json({ promoCode: code });
}
