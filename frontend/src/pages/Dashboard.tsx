function Dashboard() {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to your Retain expense manager.</p>
        </div>

        <button type="button">+ Add Expense</button>
      </header>

      <section className="overview">
        <div className="summary-card">
          <h2>Total Spent</h2>
          <p>RWF 0</p>
        </div>

        <div className="summary-card">
          <h2>Remaining Budget</h2>
          <p>RWF 0</p>
        </div>

        <div className="summary-card">
          <h2>Highest Expense</h2>
          <p>RWF 0</p>
        </div>

        <div className="summary-card">
          <h2>Budget Status</h2>
          <p>Within Budget</p>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Expenses</h2>
          <button type="button">View All</button>
        </div>

        <p>No expenses yet.</p>
      </section>

      <section className="dashboard-section">
        <h2>Spending by Category</h2>
        <p>No spending data available yet.</p>
      </section>
    </main>
  );
}

export default Dashboard;