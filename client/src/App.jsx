import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";

const API = "http://localhost:5000";


export default function App() {

  const [activeTab, setActiveTab] = useState("email");
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setDark(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDark(prefersDark);
    }
  }, []);
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const res = await axios.get(`${API}/messages/${activeTab}`);
    setData(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${API}/send`, {
      type: activeTab,
      ...formData,
    });

    toast.success("Saved Successfully");
    setFormData({});
    fetchData();
  };

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (

    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-blue-600">
          Communication Dashboard
        </h2>

        {["email", "sms", "whatsapp"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`block w-full text-left p-3 rounded mb-3 transition ${activeTab === tab
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}

        <button
          onClick={() => setDark(!dark)}
          className="mt-10 flex items-center justify-between px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 transition"
        >
          <span>{dark ? "Dark Mode" : "Light Mode"}</span>
          <span className="ml-2">
            {dark ? "🌙" : "☀️"}
          </span>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        {/* Search */}
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 p-2 border rounded w-full"
        />

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8"
        >
          <h2 className="text-xl font-bold mb-4">
            Send {activeTab.toUpperCase()}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "email" && (
              <input
                type="email"
                placeholder="Recipient Email"
                value={formData.emailTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emailTo: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            )}

            {(activeTab === "sms" || activeTab === "whatsapp") && (
              <>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mobileNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Message"
                  value={formData.message || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </>
            )}

            <button className="bg-blue-600 text-white px-6 py-2 rounded">
              Submit
            </button>
          </form>
        </motion.div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2">#</th>
                {activeTab === "email" && (
                  <th className="p-2">Email</th>
                )}
                {(activeTab === "sms" ||
                  activeTab === "whatsapp") && (
                    <>
                      <th className="p-2">Mobile</th>
                      <th className="p-2">Message</th>
                    </>
                  )}
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, i) => (
                <tr
                  key={item._id}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="p-2">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  {activeTab === "email" && (
                    <td className="p-2">{item.emailTo}</td>
                  )}
                  {(activeTab === "sms" ||
                    activeTab === "whatsapp") && (
                      <>
                        <td className="p-2">
                          {item.mobileNumber}
                        </td>
                        <td className="p-2">
                          {item.message}
                        </td>
                      </>
                    )}
                  <td className="p-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Prev
            </button>
            <span>{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>

  );
}
