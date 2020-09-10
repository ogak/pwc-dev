import React, { useState, Fragment } from "react";
import Helmet from "react-helmet";
import { Container, Col, Row, Form } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import Button from "../../shared/components/Button";
import {
  useDepartmentsQuery,
  useDestroyDepartmentMutation,
  useUpdateDepartmentMutation,
  useCreateDepartmentMutation,
} from "../../generated/graphql";
import { NetworkStatus } from "apollo-boost";
import Modal from "../../shared/components/Modal";
import Table from "../../shared/components/Table";
import DateHover from "../../shared/components/DateHover";
import { RouteComponentProps, Link } from "react-router-dom";
import { useDebounce } from "use-debounce/lib";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import { useForm } from "react-hook-form";
import Tooltip from "../../shared/components/Tooltip";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import DialogButton from "../../shared/components/DialogButton";
import * as yup from "yup";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Pagination from "../../shared/components/Pagination";
import useListState from "../../shared/hooks/useList";
import styled from "styled-components";
import PickIcon from "../../assets/Icons/PickIcon";

const Departments = ({ history }: RouteComponentProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [selected, setSelected] = useState("");
  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  const { data, networkStatus } = useDepartmentsQuery({
    variables: {
      filter: {
        name_cont: debouncedSearch,
      },
      limit,
      page,
    },
    fetchPolicy: "no-cache",
  });
  const totalCount = data?.departments?.metadata.totalCount;
  const updating = useForm({ validationSchema });
  const creating = useForm({ validationSchema });
  const departments = data?.departments?.collection;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }
  const [destroy, destroyM] = useDestroyDepartmentMutation({
    refetchQueries: ["departments"],
    onError: notifyGraphQLErrors,
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { id } });
  };
  const [update, updateM] = useUpdateDepartmentMutation({
    refetchQueries: ["departments"],
    onCompleted,
    onError: notifyGraphQLErrors,
  });
  const [create, createM] = useCreateDepartmentMutation({
    refetchQueries: ["departments"],
    onError: notifyGraphQLErrors,
    onCompleted,
  });
  const toggleEdit = (id: string) => {
    setIsEdit((p) => !p);
    setSelected(id);
  };
  const handleUpdate = (values: any) => {
    update({ variables: { input: { name: values.name || "", id: selected } } });
  };
  function onCompleted() {
    notifySuccess("Department Updated");
    setIsEdit(false);
  }
  const [modal, setModal] = useState(false);

  const handleCreate = (values: any) => {
    create({ variables: { input: { name: values.name } } });
    toggleModal();
  };
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const toggleModal = () => {
    setModal((a) => !a);
  };
  return (
    <div>
      <Helmet>
        <title>Department - PricewaterhouseCoopers</title>
      </Helmet>
      <Container fluid className="p-0 pt-3 px-4">
        <h2 style={{ fontSize: "23px" }} className="mt-2">
          Departments management
        </h2>

        <Row className="mb-5">
          <Col lg={4}>
            <Input placeholder="Search department..." onChange={handleSearch} />
          </Col>
          <Col className="text-right">
            <Link to="/user">
              <Button outline color="pwc" className="pwc mr-1">
                Users
              </Button>
            </Link>
            {isAdminPreparer ? (
              <Button className="pwc" onClick={toggleModal}>
                + Add Department
              </Button>
            ) : null}
          </Col>
        </Row>
        <Modal isOpen={modal} toggle={toggleModal} title="Create Departments">
          <Row>
            <Col>
              <Form
                onSubmit={creating.handleSubmit(handleCreate)}
                className="form"
              >
                <Row className="mt-2">
                  <Col lg={8}>
                    <Input
                      className="p-0 m-0"
                      placeholder={"Add new Department..."}
                      name="name"
                      innerRef={creating.register}
                      setValue={creating.setValue}
                      error={creating.errors.name && "Name is a required field"}
                      type="text"
                    />
                  </Col>
                  <Col>
                    <Button loading={createM.loading} className="pwc px-5">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Modal>
        <Table
          loading={networkStatus === NetworkStatus.loading}
          reloading={networkStatus === NetworkStatus.setVariables}
        >
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Department ID</th>
              <th style={{ width: "20%" }}>Name</th>
              <th style={{ width: "20%" }}>Created At</th>
              <th style={{ width: "20%" }}>Last Updated</th>
              <th style={{ width: "20%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments?.map((department, index) => (
              <tr key={index}>
                <td>{department.id}</td>
                <td>
                  {isEdit && selected === department.id ? (
                    <Input
                      className="p-0 m-0"
                      name="name"
                      defaultValue={department.name || ""}
                      innerRef={updating.register}
                      setValue={updating.setValue}
                      error={updating.errors.name && "Name is a required field"}
                    />
                  ) : (
                    department.name
                  )}
                </td>
                <td>
                  <DateHover>{department.createdAt}</DateHover>
                </td>
                <td>
                  <DateHover>{department.updatedAt}</DateHover>
                </td>
                <td>
                  {isEdit && selected === department.id ? (
                    <Fragment>
                      <DialogButton
                        color="primary"
                        onConfirm={updating.handleSubmit(handleUpdate)}
                        className="pwc mr-1"
                        loading={updateM.loading}
                      >
                        Save
                      </DialogButton>
                      <StyledDialogButton
                        loading={destroyM.loading}
                        className="ml-1 black"
                        onConfirm={() => toggleEdit(department.id)}
                      >
                        Cancel
                      </StyledDialogButton>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Fragment>
                        {(isAdmin || isAdminPreparer) && (
                          <Button
                            onClick={() => toggleEdit(department.id)}
                            className="soft orange mr-2"
                          >
                            <Tooltip description="Edit User">
                              <PickIcon
                                name="pencilFill"
                                style={{ width: "15px" }}
                              />
                            </Tooltip>
                          </Button>
                        )}
                        {isAdminReviewer ? (
                          <DialogButton
                            title="Delete"
                            data={department.id}
                            loading={destroyM.loading}
                            className="soft red mr-2 "
                            onConfirm={handleDelete}
                          >
                            <Tooltip description="Delete User">
                              <PickIcon name="trash" className="clickable" />
                            </Tooltip>
                          </DialogButton>
                        ) : null}
                      </Fragment>
                    </Fragment>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination
          totalCount={totalCount}
          perPage={limit}
          onPageChange={handlePageChange}
        />
      </Container>
    </div>
  );
};
export default Departments;
export const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;
const validationSchema = yup
  .object()
  .shape({ name: yup.string().required("This field is required") });
