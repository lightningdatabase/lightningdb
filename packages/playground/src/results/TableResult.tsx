import React from "react"
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import anyToString from "../helpers/anyToString"

type TableResultProps = {
  data: Record<string, any>[] | undefined
}

const TableResult: React.FC<TableResultProps> = ({ data }) => {
  if (!data) return null

  const dataArray = Array.isArray(data) ? data : [data]

  if (dataArray.length === 0)
    return (
      <Typography sx={{ fontStyle: "italic", mt: 2 }}>Empty result</Typography>
    )

  const columnKeys = Object.keys(dataArray[0])

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderBottom: 0,
        borderRadius: 0,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columnKeys.map(col => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataArray.map((row, index) => (
            <TableRow key={index}>
              {columnKeys.map(col => (
                <TableCell key={`${index}${col}`}>
                  {anyToString(row[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TableResult
