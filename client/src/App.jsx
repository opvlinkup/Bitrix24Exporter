import React, { useEffect, useState } from 'react';
import CompaniesTable from './components/CompaniesTable';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import axios from 'axios';

const PAGE_SIZE = 50;

function App() {
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get('/api/files');
        const filesArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.files)
          ? res.data.files
          : [];
        setFiles(filesArray.sort());
      } catch (err) {
        console.error('Error fetching files:', err);
      }
    };
    fetchFiles();
  }, []);


  useEffect(() => {
    const fetchPage = async () => {
      if (files.length === 0) return;

      setLoading(true);
      try {
        let allCompanies = [];
        let remaining = (currentPage - 1) * PAGE_SIZE;
        let pageCompaniesCount = 0;

        for (let file of files) {
          const res = await axios.get(`/api/files/${file}`);
          const data = Array.isArray(res.data) ? res.data : [];
          if (remaining >= data.length) {
            remaining -= data.length;
            continue;
          }

          const startIndex = remaining;
          const endIndex = Math.min(
            startIndex + PAGE_SIZE - pageCompaniesCount,
            data.length
          );
          allCompanies.push(...data.slice(startIndex, endIndex));
          pageCompaniesCount += endIndex - startIndex;
          remaining = 0;

          if (pageCompaniesCount >= PAGE_SIZE) break;
        }

        setCompanies(allCompanies);
      } catch (err) {
        console.error('Error fetching companies for page:', err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [currentPage, files]);

  const nextPage = () => setCurrentPage((p) => p + 1);
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
        Companies
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <CompaniesTable companies={companies} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Typography sx={{ mt: 1 }}>Page {currentPage}</Typography>
            <Button
              variant="contained"
              onClick={nextPage}
              disabled={companies.length < PAGE_SIZE}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}

export default App;
