const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmOGNmYzVlMy1iMTUzLTQ2ZTYtOGY3Yy00MmVkZGNjMWNkYTIiLCJlbWFpbCI6ImdhYnJpZWx0ZW10c2VuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyZGM1MTRkYmRjMjM0YWYxZjhhNiIsInNjb3BlZEtleVNlY3JldCI6IjIzN2QxODE3ZTZmODM5MmNlMzg0YjEwMGIyYjFjYmU2ZTI4ZjIxZmQzYTZjODZlYTBiZDZhN2Q1NWMwYTFjN2UiLCJleHAiOjE3NTU2OTAxNDh9.wasWPv3lsyAifnROwXwo2WtaI-yXbZ9FpSCqLHtpmk4";
const GATEWAY = "beige-lively-guppy-253.mypinata.cloud";

// Function to pin a file to IPFS
export async function pinFileToIPFS(file: any, fileName: any) {
  try {
    const data = new FormData();
    data.append("file", file, fileName);

    const request = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    });
    const response = await request.json();
    if (response.IpfsHash) {
      return response.IpfsHash; // Return the CID
    } else {
      throw new Error("Failed to pin file to IPFS");
    }
  } catch (error) {
    console.error("Error pinning file to IPFS:", error);
    throw error;
  }
}

// Function to fetch a file from IPFS using CID
export async function fetchFileFromIPFS(cid: any) {
  const url = `https://${GATEWAY}/ipfs/${cid}`;
  try {
    const request = await fetch(url);
    if (!request.ok) {
      throw new Error("Failed to fetch file from IPFS");
    }
    const response = await request.text();
    return response; // Return the file content
  } catch (error) {
    console.error("Error fetching file from IPFS:", error);
    throw error;
  }
}





