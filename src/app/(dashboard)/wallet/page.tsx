import { createClient } from "@/lib/supabase/server";
import { formatMilhas } from "@/lib/utils";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("rm_wallets")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  const { data: transactions } = await supabase
    .from("rm_transactions")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const balance = wallet?.balance ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Your PaceCoin balance and transaction history
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
        <p className="text-sm opacity-80">Current Balance</p>
        <p className="text-5xl font-bold mt-2">{formatMilhas(balance)}</p>
        <p className="text-sm opacity-80 mt-1">PaceCoin</p>
        <div className="flex gap-8 mt-6">
          <div>
            <p className="text-xs opacity-70">Total Earned</p>
            <p className="font-semibold">
              {formatMilhas(wallet?.total_earned ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-70">Total Spent</p>
            <p className="font-semibold">
              {formatMilhas(wallet?.total_spent ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {transactions && transactions.length > 0 ? (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold text-sm ${
                      tx.amount > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {formatMilhas(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {formatMilhas(tx.balance_after)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              No transactions yet. Start training to earn PaceCoin!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
