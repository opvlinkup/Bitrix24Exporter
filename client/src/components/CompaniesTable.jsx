import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material'

const TABLE_HEADERS = ['ID', 'Title', 'Phone', 'Email', 'Address', 'Created At']

export default function CompaniesTable({ companies = [] }) {
    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleString()
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {TABLE_HEADERS.map((header) => (
                            <TableCell key={header}>{header}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {companies.map((company) => (
                        <TableRow key={company.id}>
                            <TableCell>{company.id}</TableCell>
                            <TableCell>{company.title}</TableCell>
                            <TableCell>{company.phone}</TableCell>
                            <TableCell>{company.email}</TableCell>
                            <TableCell>{company.address}</TableCell>
                            <TableCell>{formatDate(company.createdAt)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
