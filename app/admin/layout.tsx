import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
};

const AdminLayout = async ({ children }: Props) => {
  const user = await currentUser();

  if (user?.publicMetadata?.role !== "admin") {
    redirect("/learn");
  }

  return <>{children}</>;
};

export default AdminLayout;
