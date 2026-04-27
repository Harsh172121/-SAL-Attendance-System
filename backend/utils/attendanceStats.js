const summarizeAttendanceRecords = (records = []) => {
  const summary = records.reduce((acc, record) => {
    if (record.status === 'present') {
      acc.present += 1;
    } else if (record.status === 'leave') {
      acc.leave += 1;
    } else {
      acc.absent += 1;
    }
    acc.total += 1;
    return acc;
  }, {
    present: 0,
    leave: 0,
    absent: 0,
    total: 0
  });

  const consideredTotal = summary.present + summary.absent;

  return {
    ...summary,
    consideredTotal,
    percentage: consideredTotal > 0 ? Math.round((summary.present / consideredTotal) * 100) : 0
  };
};

module.exports = {
  summarizeAttendanceRecords
};
