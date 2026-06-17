import mongoose from "mongoose";

async function testConcurrency() {
  console.log("Starting concurrency test...");

  // 1. Fetch products to get a variant ID
  const prodRes = await fetch("http://localhost:3001/api/products");
  const prodData = await prodRes.json();
  const camera = prodData.data.find((p: any) => p.slug === "cam-v4");
  
  // 2. Create a bundle
  const bundleReq = {
    sessionId: "concurrency-test",
    items: [
      {
        productId: camera._id,
        variantId: camera.variants[0]._id,
        quantity: 10, // Try to buy all 10 in stock
      }
    ],
    planId: null
  };

  const createRes = await fetch("http://localhost:3001/api/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bundleReq)
  });
  const bundleData = await createRes.json();
  const bundleId = bundleData.bundle._id;

  // 3. Try to checkout concurrently
  console.log("Sending two concurrent checkout requests for bundle:", bundleId);
  const checkoutPayload = JSON.stringify({ bundleId });

  const [req1, req2] = await Promise.all([
    fetch("http://localhost:3001/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: checkoutPayload
    }),
    fetch("http://localhost:3001/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: checkoutPayload
    })
  ]);

  const res1 = await req1.json();
  const res2 = await req2.json();

  console.log("--- RESULTS ---");
  console.log("Request 1:", res1.message || res1.error);
  console.log("Request 2:", res2.message || res2.error);
}

testConcurrency().catch(console.error);
