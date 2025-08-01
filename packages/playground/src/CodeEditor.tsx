import React, { useEffect, useState } from "react"
import { Editor, useMonaco } from "@monaco-editor/react"
import { Alert, Box } from "@mui/material"
import * as monacoEditor from "monaco-editor"

type CodeEditorProps = {
  value: string
  onChange: (val: string) => void
  typeDefs: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  typeDefs,
}) => {
  const [error, setError] = useState<string | null>(null)
  const [codeUri, setCodeUri] = useState<monacoEditor.Uri | null>(null)

  const monaco = useMonaco()

  useEffect(() => {
    if (!monaco) return

    // --- Inject typedefs ---
    const typedefUri = monaco.Uri.parse("inmemory://model/typedefs.d.ts")
    if (!monaco.editor.getModel(typedefUri)) {
      monaco.editor.createModel(typeDefs, "typescript", typedefUri)
    }

    // --- Set up user code model ---
    const userUri = monaco.Uri.parse("inmemory://model/user.ts")
    setCodeUri(userUri)

    if (!monaco.editor.getModel(userUri)) {
      monaco.editor.createModel(value, "typescript", userUri)
    }
  }, [monaco])

  // Validate user input
  const validateCode = (value: string | undefined) => {
    if (!value) {
      setError("Code is empty")
      return
    }

    const trimmed = value.trim()

    // Check if it starts with define(...) and nothing else
    const validDefineCall = /^(useQuery|useMutation)\s*\([\s\S]*\);?\s*$/.test(
      trimmed,
    )

    if (!validDefineCall) {
      setError(
        "Code must be a single call to useQuery(...) or useMutation(...)",
      )
    } else {
      setError(null)
    }

    onChange(value)
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {codeUri && (
        <Editor
          height="400px"
          defaultLanguage="typescript"
          path={codeUri.toString()}
          theme="vs-light"
          value={value}
          onChange={validateCode}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            contextmenu: false,
            lineNumbers: "off",
            showFoldingControls: "never",
          }}
        />
      )}
    </Box>
  )
}

export default CodeEditor
