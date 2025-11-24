
from groq import Groq

key="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"

# key = os.getenv("GROQ_API_KEY")



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
    try:
        # Use an available model - llama-3.1-70b-versatile is a good alternative
        # Other options: llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it
        comletion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated to available model
            messages=[
                {
                    "role":"user",
                    "content":prompt,
                }
            ],
            temperature=0.7,  # Lower temperature for more consistent results
            top_p=0.9)
        result=comletion.choices[0].message.content
        print("Ai analysis output",result)
        return result
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR in Groq API call: {error_msg}")
        # Return a structured error response
        error_response = {
            "issues": [
                {
                    "type": "error",
                    "line": 0,
                    "description": f"AI Analysis failed: {error_msg}",
                    "suggestion": "Please check your Groq API key and model availability"
                }
            ]
        }
        return str(error_response).replace("'", '"')  # Convert to JSON string
