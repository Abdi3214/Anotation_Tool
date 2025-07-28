
const AssignedTextsPage = () => {
  const assignedTexts = [
    { id: 1011, source: "It is a fine day.", due: "Aug. 15, 2024", status: "Pending" },
    { id: 1012, source: "She gave him water", due: "Aug. 20, 2024", status: "In Progress" },
    { id: 1013, source: "The house is empty", due: "Aug. 25, 2024", status: "Pending" },
    { id: 1014, source: "Is it raining now?", due: "Aug. 30, 2024", status: "Completed" },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          Assigned Texts
        </h1>
        <table className="w-full table-auto text-sm sm:text-base">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-600">Text ID</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-600">Source</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-600">Due Date</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-600">Status</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedTexts.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{item.id}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{item.source}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{item.due}</td>
                <td className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-medium rounded ${getStatusStyle(item.status)}`}>
                  {item.status}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    Start Annotation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedTextsPage;
