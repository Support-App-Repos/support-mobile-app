const getMonth = (m) => {
  let month = '';
  switch (m) {
    case 0: {
      month = 'January';
      break;
    }
    case 1: {
      month = 'February';
      break;
    }
    case 2: {
      month = 'March';
      break;
    }
    case 3: {
      month = 'April';
      break;
    }
    case 4: {
      month = 'May';
      break;
    }
    case 5: {
      month = 'June';
      break;
    }
    case 6: {
      month = 'July';
      break;
    }
    case 7: {
      month = 'August';
      break;
    }
    case 8: {
      month = 'September';
      break;
    }
    case 9: {
      month = 'October';
      break;
    }
    case 10: {
      month = 'November';
      break;
    }
    case 11: {
      month = 'December';
      break;
    }
  }
  return month;
};

const getMonthShort = (m) => {
  let month = '';
  switch (m) {
    case 0: {
      month = 'Jan';
      break;
    }
    case 1: {
      month = 'Feb';
      break;
    }
    case 2: {
      month = 'Mar';
      break;
    }
    case 3: {
      month = 'Apr';
      break;
    }
    case 4: {
      month = 'May';
      break;
    }
    case 5: {
      month = 'Jun';
      break;
    }
    case 6: {
      month = 'Jul';
      break;
    }
    case 7: {
      month = 'Aug';
      break;
    }
    case 8: {
      month = 'Sep';
      break;
    }
    case 9: {
      month = 'Oct';
      break;
    }
    case 10: {
      month = 'Nov';
      break;
    }
    case 11: {
      month = 'Dec';
      break;
    }
  }
  return month;
};

const getDateStr = (dateStr, short) => {
  let res = ''; // January 29, 2021
  if (dateStr) {
    const date = new Date(dateStr);
    const month = short
      ? getMonthShort(date.getMonth())
      : getMonth(date.getMonth());
    res = `${month} ${date.getDate()}, ${date.getFullYear()}`;
  }
  return res;
};

const generateOrderId = () => {
  const prefix = "ORD"; // Prefix for the order ID

  // Shorten the timestamp to just 'YYYYY' (first 5 digits of the year)
  const timestamp = new Date().getFullYear().toString().slice(0, 7); // '20250'

  const randomSuffix = Math.floor(Math.random() * 1000); // Random number to make the ID more unique

  const orderId = `${prefix}-${timestamp}-${randomSuffix}`;
  console.log(orderId); // Example: 'ORD-20250-123'

  return orderId;
};


module.exports = {
  getDateStr,
  generateOrderId
};
