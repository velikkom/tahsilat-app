import Navbar from "@/components/layout/NavBar";
import Sidebar from "@/components/layout/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div
      className="
                d-flex
                min-vh-100
            "
    >
      <Sidebar />

      <div
        className="
                    flex-grow-1
                    d-flex
                    flex-column
                "
      >
        <Navbar />

        <main
          className="
                        flex-grow-1
                        p-4
                    "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
