import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("dropbydrop");
    const collection = db.collection("survey_responses");

    const data = await collection.find({}).sort({ submittedAt: -1 }).toArray();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
}
