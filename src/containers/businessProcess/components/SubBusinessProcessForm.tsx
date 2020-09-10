import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Form, Input } from "reactstrap";
import { useCreateSubBusinessProcessMutation } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";

const SubBusinessProcessForm = ({ parentId }: SubBusinessProcessFormProps) => {
  const { register, handleSubmit, reset } = useForm();
  const [createSubBusinessProcess] = useCreateSubBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Create Success");
      reset();
    },
    onError: (error) => {
      toast.error("Create Failed");
    },
    refetchQueries: [
      "businessProcess",
      "businessProcesses",
      "adminBusinessProcessTree",
    ],
  });

  function submit(values: any) {
    createSubBusinessProcess({
      variables: {
        input: {
          name: values.name,
          parentId,
        },
      },
    });
  }
  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="d-flex align-items-center mb-4"
    >
      <Input
        name="name"
        placeholder="Sub business process name*"
        innerRef={register}
        required
      />
      <DialogButton
        type="button"
        onConfirm={handleSubmit(submit)}
        className="button pwc ml-3"
        message="Add sub business process?"
      >
        Add
      </DialogButton>
    </Form>
  );
};

export default SubBusinessProcessForm;

interface SubBusinessProcessFormProps {
  parentId: string;
}
