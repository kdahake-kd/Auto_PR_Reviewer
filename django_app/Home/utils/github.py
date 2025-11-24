import requests
import base64
from urllib.parse import urlparse
import uuid
from .ai_agent import analyze_code_with_llm

def get_owner_and_repo(url):
    # Remove trailing slash and parse
    url = url.rstrip('/')
    pass_url=urlparse(url)
    path_parts=pass_url.path.strip("/").split("/")
    if len(path_parts)>=2:
        owner=path_parts[0]
        repo=path_parts[1]
        # Remove .git suffix if present
        if repo.endswith('.git'):
            repo = repo[:-4]
        print(f"Parsed owner: {owner}, repo: {repo}")
        return owner,repo
    print(f"ERROR: Could not parse owner/repo from URL: {url}")
    return None,None

def fetch_pr_files(repo_url,pr_number,github_token=None):
    owner,repo=get_owner_and_repo(repo_url)
    if not owner or not repo:
        raise Exception(f"Invalid repository URL format: {repo_url}. Expected format: https://github.com/owner/repo")
    
    url=f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files"
    print(f"Fetching PR files from: {url}")
    headers = {}
    if github_token:
        headers["Authorization"] = f"token {github_token}"  # Fixed: space after "token"
    headers["Accept"] = "application/vnd.github.v3+json"
    
    response=requests.get(url,headers=headers)
    if response.status_code == 404:
        error_data = response.json() if response.content else {}
        error_msg = error_data.get('message', 'Not Found')
        raise Exception(f"GitHub API 404: PR #{pr_number} not found in {owner}/{repo}. Error: {error_msg}. Please verify the PR number exists.")
    elif response.status_code != 200:
        error_data = response.json() if response.content else {}
        error_msg = error_data.get('message', response.text)
        raise Exception(f"GitHub API error {response.status_code}: {error_msg}")
    return response.json()


def fetch_file_content_from_raw_url(raw_url, github_token=None):
    """Fetch file content directly from raw_url (works for PR files)"""
    headers = {}
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    headers["Accept"] = "text/plain"
    
    response = requests.get(raw_url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch file from raw_url: {response.status_code} {response.text}")
    return response.text

def fetch_file_content(repo_url,file_path,github_token=None,ref=None):
    """Fetch file content using contents API (for default branch or specific ref)"""
    owner,repo=get_owner_and_repo(repo_url)
    if not owner or not repo:
        raise Exception(f"Invalid repository URL format: {repo_url}")
    
    url=f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
    if ref:
        url += f"?ref={ref}"
    
    headers = {}
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    headers["Accept"] = "application/vnd.github.v3+json"
    
    response=requests.get(url,headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch file {file_path}: {response.status_code} {response.text}")
    content=response.json()
    return base64.b64decode(content['content']).decode()

def analyze_pr(repo_url,pr_number,github_token=None,task_id=None):
    # Use provided task_id or generate one if not provided (for backward compatibility)
    if task_id is None:
        task_id = str(uuid.uuid4())
    try:
        print(f"Starting analysis for PR #{pr_number} in {repo_url}")
        pr_files=fetch_pr_files(repo_url,pr_number,github_token)
        print(f"Found {len(pr_files)} files in PR")
        
        if len(pr_files) == 0:
            print(f"WARNING: PR #{pr_number} has no files changed")
            return {"task_id":task_id,"result":[{"file_name": "No files", "analysis": '{"issues": [{"type": "info", "description": "This PR has no files changed", "suggestion": "No analysis needed"}]}'}]}
        
        analysis_results=[]
        for idx, file in enumerate(pr_files, 1):
            file_name=file['filename']
            print(f"Analyzing file {idx}/{len(pr_files)}: {file_name}")
            try:
                # Use raw_url from PR files response (includes correct branch/ref)
                if 'raw_url' in file:
                    print(f"  Using raw_url: {file['raw_url']}")
                    raw_content = fetch_file_content_from_raw_url(file['raw_url'], github_token)
                else:
                    # Fallback to contents API (might not work for PR files)
                    print(f"  Using contents API (fallback)")
                    raw_content = fetch_file_content(repo_url, file_name, github_token)
                
                analysis_result=analyze_code_with_llm(raw_content,file_name)
                analysis_results.append({"analysis":analysis_result,"file_name":file_name})
                print(f"✓ Completed analysis for {file_name}")
            except Exception as file_error:
                print(f"ERROR analyzing file {file_name}: {str(file_error)}")
                import traceback
                traceback.print_exc()
                analysis_results.append({
                    "file_name": file_name,
                    "analysis": f'{{"issues": [{{"type": "error", "description": "Failed to analyze file: {str(file_error)}", "suggestion": "Please check file access"}}]}}'
                })
        
        print(f"Analysis complete: {len(analysis_results)} files analyzed")
        return {"task_id":task_id,"result":analysis_results}
    except Exception as e:
        print(f"ERROR in analyze_pr: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"task_id":task_id,"result":[{"file_name": "Error", "analysis": f'{{"issues": [{{"type": "error", "description": "Analysis failed: {str(e)}", "suggestion": "Please check repository URL and PR number"}}]}}'}]}


