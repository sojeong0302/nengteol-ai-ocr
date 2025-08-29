const svc = require("./aiClassificationService");

(async () => {
  const items = [
    { name: "농심 신라면", quantity: 5, unit: "개", price: 4500 },
    { name: "중형 세탁세제", quantity: 1, unit: "개", price: 8900 },
    { name: "매일우유 1L",   quantity: 2, unit: "팩", price: 4200 }
  ];
  try {
    const res = await svc.classifyFoodItems(items);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("ERR:",
      e?.response?.status || "",
      e?.response?.data || e.message
    );
    process.exit(1);
  }
})();
