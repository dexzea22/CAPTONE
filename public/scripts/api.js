// Fetch order statistics and render chart with analysis
async function fetchOrderData() {
    const response = await fetch("/api/order-stats");
    const data = await response.json();
    return data;
}

async function renderOrderChart() {
    const orderData = await fetchOrderData();

    const labels = orderData.map(item => item.date);
    const data = orderData.map(item => item.totalAmount);

    const ctx = document.getElementById("orderChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Order Amount",
                data: data,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    const totalOrders = data.reduce((sum, amount) => sum + amount, 0);
    const averageOrderAmount = totalOrders / data.length;
    document.getElementById('orderAnalysis').innerHTML = `
        <p>Total orders amount to <b>₱${totalOrders.toFixed(2)}</b> over the past 30 days.</p>
        <p>The average daily order amount is <b>₱${averageOrderAmount.toFixed(2)}</b>.</p>
        <p>The trend shows <b>${data[data.length - 1] > data[0] ? 'an increase' : 'a decrease'}</b> in order amounts.</p>
    `;
}

// Fetch top-selling items and render chart with analysis
async function fetchTopSellingItems() {
    const response = await fetch('/api/top-selling-items');
    const data = await response.json();
    return data;
}

async function renderTopSellingChart() {
    const topItems = await fetchTopSellingItems();

    const labels = topItems.map(item => item.name);
    const data = topItems.map(item => item.totalSales);

    const ctx = document.getElementById('topSellingChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    const topItem = topItems[0];
    document.getElementById('topSellingAnalysis').innerHTML = `
        <p>The top-selling item is <b>${topItem.name}</b> with a total sales amount of <b>₱${topItem.totalSales.toFixed(2)}</b>.</p>
        <p>Consider promoting these top items further to leverage their popularity.</p>
    `;
}

// Fetch monthly revenue and render chart with analysis
async function fetchMonthlyRevenue() {
    const response = await fetch('/api/monthly-revenue');
    const data = await response.json();
    return data;
  }
  
  async function renderMonthlyRevenueChart() {
    const monthlyRevenue = await fetchMonthlyRevenue();
  
    const labels = monthlyRevenue.map(item => item.month);
    const data = monthlyRevenue.map(item => item.totalRevenue);
  
    const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Revenue',
          data: data,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: { 
            beginAtZero: true,
            reverse: true // Make sure the X-axis is in the correct order
          },
          y: { 
            beginAtZero: true 
          }
        }
      }
    });
  
    // Textual analysis
    const highestRevenueMonth = monthlyRevenue.reduce((max, item) => item.totalRevenue > max.totalRevenue ? item : max, monthlyRevenue[0]);
    document.getElementById('monthlyRevenueAnalysis').innerHTML = `
      <p>Total revenue for the past months is shown in the chart.</p>
      <p>The highest revenue was recorded in ${highestRevenueMonth.month} with ₱${highestRevenueMonth.totalRevenue.toFixed(2)}.</p>
      <p>Focus on the months with lower revenue to identify potential causes and solutions.</p>
    `;
  }

// Fetch daily orders trend and render chart with analysis
async function fetchDailyOrdersTrend() {
    const response = await fetch('/api/daily-orders-trend');
    const data = await response.json();
    return data;
}

async function renderDailyOrdersTrendChart() {
    const dailyOrders = await fetchDailyOrdersTrend();

    const labels = dailyOrders.map(item => item.date);
    const data = dailyOrders.map(item => item.totalOrders);

    const ctx = document.getElementById('dailyOrdersTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Orders',
                data: data,
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    const totalOrders = data.reduce((sum, count) => sum + count, 0);
    const averageDailyOrders = totalOrders / data.length;
    document.getElementById('dailyOrdersAnalysis').innerHTML = `
        <p>Total orders over the past month are shown in the chart.</p>
        <p>The average daily order count is ${averageDailyOrders.toFixed(0)}.</p>
        <p>Identify days with unusual spikes or drops for further analysis.</p>
    `;
}

// Fetch customer satisfaction ratings and render chart with analysis
// async function fetchCustomerSatisfaction() {
//     const response = await fetch('/api/customer-satisfaction');
//     const data = await response.json();
//     return data;
// }

// async function renderCustomerSatisfactionChart() {
//     const satisfactionData = await fetchCustomerSatisfaction();

//     const labels = satisfactionData.map(item => item.aspect);
//     const data = satisfactionData.map(item => item.averageRating);

//     const ctx = document.getElementById('customerSatisfactionChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'radar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Average Rating',
//                 data: data,
//                 backgroundColor: 'rgba(153, 102, 255, 0.2)',
//                 borderColor: 'rgba(153, 102, 255, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 r: {
//                     angleLines: {
//                         display: false
//                     },
//                     suggestedMin: 0,
//                     suggestedMax: 5
//                 }
//             }
//         }
//     });

//     const bestAspect = satisfactionData.reduce((max, item) => item.averageRating > max.averageRating ? item : max, satisfactionData[0]);
//     document.getElementById('customerSatisfactionAnalysis').innerHTML = `
//         <p>The average customer satisfaction ratings are shown in the chart.</p>
//         <p>The aspect with the highest rating is ${bestAspect.aspect} with an average rating of ${bestAspect.averageRating.toFixed(1)}.</p>
//         <p>Focus on aspects with lower ratings for improvement.</p>
//     `;
// }

// Fetch revenue by day of the week and render chart with analysis
async function fetchRevenueByDay() {
    const response = await fetch('/api/revenue-by-day');
    const data = await response.json();
    return data;
}

async function renderRevenueByDayChart() {
    const revenueByDay = await fetchRevenueByDay();

    const labels = revenueByDay.map(item => item.day);
    const data = revenueByDay.map(item => item.totalRevenue);

    const ctx = document.getElementById('revenueByDayChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue by Day',
                data: data,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    const highestRevenueDay = revenueByDay.reduce((max, item) => item.totalRevenue > max.totalRevenue ? item : max, revenueByDay[0]);
    document.getElementById('revenueByDayAnalysis').innerHTML = `
        <p>Revenue by day of the week is shown in the chart.</p>
        <p>The highest revenue was recorded on ${highestRevenueDay.day} with ₱${highestRevenueDay.totalRevenue.toFixed(2)}.</p>
        <p>Consider analyzing days with lower revenue to optimize strategies.</p>
    `;
}

// Fetch yearly revenue and render chart with analysis
async function fetchYearlyRevenue() {
    const response = await fetch('/api/yearly-revenue');
    const data = await response.json();
    return data;
  }
  
  async function renderYearlyRevenueChart() {
    const yearlyRevenue = await fetchYearlyRevenue();
  
    const labels = yearlyRevenue.map(item => item.year);
    const data = yearlyRevenue.map(item => item.totalRevenue);
  
    const ctx = document.getElementById('yearlyRevenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Revenue',
          data: data,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: { 
            beginAtZero: true,
            reverse: false // Make sure the X-axis is in the correct order
          },
          y: { 
            beginAtZero: true 
          }
        }
      }
    });
  
    // Textual analysis
    const highestRevenueYear = yearlyRevenue.reduce((max, item) => item.totalRevenue > max.totalRevenue ? item : max, yearlyRevenue[0]);
    document.getElementById('yearlyRevenueAnalysis').innerHTML = `
      <p>Total revenue for the past years is shown in the chart.</p>
      <p>The highest revenue was recorded in ${highestRevenueYear.year} with ₱${highestRevenueYear.totalRevenue.toFixed(2)}.</p>
      <p>Focus on the years with lower revenue to identify potential causes and solutions.</p>
    `;
  }

// Call functions to render charts and analysis
renderOrderChart();
renderTopSellingChart();
renderMonthlyRevenueChart();
renderDailyOrdersTrendChart();
//renderCustomerSatisfactionChart();
renderRevenueByDayChart();
renderYearlyRevenueChart();
