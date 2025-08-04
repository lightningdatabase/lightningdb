import { Alert, Typography, type SxProps } from "@mui/material"

type CodeBlockProps = {
  code: string
  sx?: SxProps
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, sx }) => (
  <Alert severity="info" sx={{ ...sx }} icon={false}>
    <Typography component="pre">{code}</Typography>
  </Alert>
)

export default CodeBlock
