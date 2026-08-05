import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "mustafasacar50";
const GITHUB_REPO = process.env.GITHUB_REPO || "bg";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

/**
 * Gets a file from GitHub repo. 
 * If running locally without a token, falls back to local file system.
 */
export async function getGitHubFile(filePath: string) {
  // Local fallback if no GitHub token is provided
  if (!GITHUB_TOKEN) {
    const localPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(localPath)) {
      return { content: fs.readFileSync(localPath, 'utf8'), sha: null };
    }
    return { content: "[]", sha: null };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      }
    );

    if (res.status === 404) {
      // Fallback to local file if it doesn't exist on GitHub yet
      const localPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(localPath)) {
        console.log(`[GitHub API] ${filePath} not found on GitHub, falling back to local file.`);
        return { content: fs.readFileSync(localPath, 'utf8'), sha: null };
      }
      return { content: "[]", sha: null };
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content, sha: data.sha };
  } catch (error) {
    console.error(`Error reading ${filePath} from GitHub:`, error);
    // Ultimate fallback to local in case of network error
    const localPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(localPath)) {
      return { content: fs.readFileSync(localPath, 'utf8'), sha: null };
    }
    throw error;
  }
}

/**
 * Updates a file in GitHub repo.
 * If running locally without a token, falls back to local file system.
 */
export async function updateGitHubFile(filePath: string, content: string, message: string) {
  // Local fallback if no GitHub token is provided
  if (!GITHUB_TOKEN) {
    const localPath = path.join(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, content, 'utf8');
    return;
  }

  try {
    // We need the current file SHA to update it
    const current = await getGitHubFile(filePath);
    const sha = current.sha;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          sha: sha || undefined, // undefined if creating a new file
          branch: GITHUB_BRANCH
        })
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`GitHub API error on write: ${res.statusText} - ${errorData}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error writing ${filePath} to GitHub:`, error);
    throw error;
  }
}
