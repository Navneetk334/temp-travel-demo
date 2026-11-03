async function checkLive() {
  try {
    const res = await fetch("https://temp-travel-demo.vercel.app/api/bookings");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
checkLive();

