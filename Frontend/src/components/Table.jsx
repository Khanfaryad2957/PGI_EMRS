const Table = ({ columns, data, loading = false, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-white/30">
        <thead className="backdrop-blur-md bg-white/50 border-b border-white/40">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="backdrop-blur-sm bg-white/40 divide-y divide-white/30">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/60 transition-colors duration-200">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(row, rowIndex)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

