import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ results: [], message: "GITHUB_TOKEN is missing. Returning empty array." });
    }

    const octokit = new Octokit({ auth: token });
    
    const owner = process.env.GITHUB_OWNER || "mustafasacar50";
    const repo = process.env.GITHUB_REPO || "bg";

    if (!owner || !repo) {
      return NextResponse.json({ error: "GITHUB_OWNER or GITHUB_REPO is missing." }, { status: 500 });
    }

    // List files in data/results/
    let files;
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "data/results",
      });
      files = Array.isArray(response.data) ? response.data : [response.data];
    } catch (e: any) {
      if (e.status === 404) {
        return NextResponse.json({ results: [] }); // No results yet
      }
      throw e;
    }

    // Fetch contents of each file
    const results = await Promise.all(
      files.map(async (file: any) => {
        const fileData = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
        });
        
        if (!Array.isArray(fileData.data) && fileData.data.type === "file") {
          const content = Buffer.from(fileData.data.content, "base64").toString("utf-8");
          return JSON.parse(content);
        }
        return null;
      })
    );

    return NextResponse.json({ results: results.filter(Boolean) });
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
