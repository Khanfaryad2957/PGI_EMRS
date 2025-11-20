import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUsers } from 'react-icons/fi';
import {
  useGetAllClinicalProformasQuery,
  useDeleteClinicalProformaMutation,
} from '../../features/clinical/clinicalApiSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ClinicalProformaPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data, isLoading, isFetching, refetch, error } = useGetAllClinicalProformasQuery({ page, limit }, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [deleteProforma] = useDeleteClinicalProformaMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinical proforma?')) {
      try {
        await deleteProforma(id).unwrap();
        toast.success('Clinical proforma deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete proforma');
      }
    }
  };


  const columns = [
    {
      header: 'Patient',
      accessor: 'patient_name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <FiUsers className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{row.patient_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Visit Date',
      render: (row) => formatDate(row.visit_date),
    },
    {
      header: 'Visit Type',
      render: (row) => (
        <Badge variant={row.visit_type === 'first_visit' ? 'primary' : 'default'}>
          {row.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
        </Badge>
      ),
    },
    {
      header: 'Diagnosis',
      accessor: 'diagnosis',
      render: (row) => <span>{row.diagnosis || 'N/A'}</span>,
    },
    {
      header: 'Decision',
      render: (row) => (
        <Badge variant={row.doctor_decision === 'complex_case' ? 'warning' : 'success'}>
          {row.doctor_decision === 'complex_case' ? 'Complex' : 'Simple'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/clinical/${row.id}`}>
            <Button variant="ghost" size="sm">
              <FiEye />
            </Button>
          </Link>
          <Link to={`/clinical/${row.id}/edit`}>
            <Button variant="ghost" size="sm">
              <FiEdit />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
            <FiTrash2 className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Walk-in Clinical Proforma</h1>
          <p className="text-gray-600 mt-1">Manage clinical assessments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refetch(); }} disabled={isFetching}>
            <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link to="/clinical/new">
            <Button>
              <FiPlus className="mr-2" /> New Proforma
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-4">
            <LoadingSpinner className="hidden" />
            <p className="text-red-600 text-sm">{error?.data?.message || 'Failed to load clinical proformas.'}</p>
          </div>
        )}
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search clinical records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {(isLoading || isFetching) ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.data?.proformas || []}
              loading={isLoading}
            />

            {data?.data?.pagination && (
              <Pagination
                currentPage={data.data.pagination.page}
                totalPages={data.data.pagination.pages}
                totalItems={data.data.pagination.total}
                itemsPerPage={limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ClinicalProformaPage;

