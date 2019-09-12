import React from 'react';
import {Pagination as PaginationComponent, PaginationItem, PaginationLink} from "reactstrap";
import ReactPaginate from 'react-paginate';
import PropTypes from "prop-types";
import {ProductProptypes} from "../../utils/proptypes";
import ProductSearchModal from "./ProductSearchModal";
import Nav from "reactstrap/es/Nav";
import Navbar from "reactstrap/es/Navbar";

const Pagination = (props) => {
  const { page, totalPage, goToPage } = props;
  return (
    <div>
      <Navbar className="d-flex justify-content-center m-3">
        <ReactPaginate
          previousLabel={'«'}
          nextLabel={'»'}
          breakLabel={'...'}
          pageCount={totalPage}
          marginPagesDisplayed={4}
          pageRangeDisplayed={4}
          onPageChange={({ selected }) => { goToPage(selected+1); }}
          containerClassName={'pagination'}
          pageClassName={'page-item'}
          pageLinkClassName={'page-link'}
          activeClassName={'active'}
          activeLinkClassName={'active'}
          breakClassName={'page-item disabled'}
          breakLinkClassName={'page-link disabled'}
          previousClassName={'page-item'}
          previousLinkClassName={'page-link'}
          nextClassName={'page-item'}
          nextLinkClassName={'page-link'}
          disabledClassName={'disabled'}
          forcePage={page-1}
          initialPage={page-1}
          hrefBuilder={(page) => {
            const pageNumber = page+1;
            return (
              <PaginationItem active={page == pageNumber} key={`page_${pageNumber}`}>
                <PaginationLink tag="button" onClick={()=> { goToPage(pageNumber); }}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          }}
        />
      </Navbar>
    </div>
  )
};


ProductSearchModal.propTypes = {
  page: PropTypes.number.isRequired,
  totalPage: PropTypes.number.isRequired,
  goToPage: PropTypes.func.isRequired,
};

export default Pagination;
