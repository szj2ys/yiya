import dynamic from "next/dynamic";

const App = dynamic(() => import("./app"), { ssr: false });

// Admin access is enforced by the layout (app/admin/layout.tsx).
// No additional guard is needed here.
const AdminPage = () => {
  return (
    <App />
  );
};

export default AdminPage;
