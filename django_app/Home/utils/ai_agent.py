
from groq import Groq

key="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"


def analyze_code_with_llm(file_content,file_name):
    prompt=f"""
       Analyze the Following Code
       - Code Style and Formatting issues
       - Potential Bugs and Errors
       - Performance Improvement
       - Best Practices
    
    File : {file_name}
    Content:{file_content}

    Provide the detailed JSON output with the structure 
    {{
       "issues":[
          {{
                "type": "<style|bugs|performance|best_practice>",
                "line": "<line_number>",
                "description": "<description>",
                "suggestion": "<suggestion>"
         
           }}
       ]
    
    }}
    ```json
    """
    client=Groq(
        api_key=key
    )
    comletion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role":"user",
                "content":prompt,

            }
        ],
        temperature=1,
        top_p=1)
    result=comletion.choices[0].message.content
    print("Ai analysis output",result)
    return result
