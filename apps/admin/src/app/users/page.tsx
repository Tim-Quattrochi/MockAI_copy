// src/app/users/page.tsx
export default async function UsersPage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`);

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const data = await res.json();
    const { users } = data;

    return (
      <div className="users">
        <h1>User List</h1>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Date Joined</th>
              <th>Total Questions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.joined}</td>
                <td>{user.total_questions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    console.error("Error fetching users:", error);

    return (
      <div>
        <h1>Failed to load users</h1>
        <p>{error.message}</p>
      </div>
    );
  }
}
