import React, { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { Status, LevelOfRisk } from "../../../generated/graphql";
import useForm from "react-hook-form";
import * as yup from "yup";
import { Form } from "reactstrap";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import Button from "../../../shared/components/Button";
import { oc } from "ts-optchain";

const RiskForm = ({
  onSubmit,
  defaultValues,
  submitting
}: RiskFormProps) => {
  const { register, setValue, watch, errors, handleSubmit } = useForm<
    RiskFormValues
  >({
    validationSchema,
    defaultValues
  });

  useEffect(() => {
    register({ name: "levelOfRisk", required: true });
    register({ name: "status", required: true });
  }, [register]);

  // function handleChange(name: string, value: string) {
    // }
    
    const handleChange = (name: string) => ({ value } : any) => {
        setValue(name, value);
    
  }

  const submit = (values: RiskFormValues) => {
    onSubmit && onSubmit(values);
    console.log('values:', values)
  }
 
  const levelOfRisks = Object.entries(LevelOfRisk).map(([label, value]) => ({
    label,
    value
  }));
  const statuses = Object.entries(Status).map(([label, value]) => ({
    label,
    value
  }));

  const levelOfRisk = oc(defaultValues).levelOfRisk()
  const status = oc(defaultValues).status()
  const name = oc(defaultValues).name()

  console.log('name', name);

  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="name"
          label="Name"
          innerRef={register({ required: true })}
          error={errors.name && errors.name.message}
        />
        <Select
          name="levelOfRisk"
          label="Level of Risk"
          options={levelOfRisks}
          innerRef={register({ required: true })}
          onChange={handleChange("levelOfRisk")}
          error={errors.levelOfRisk && errors.levelOfRisk.message}
          defaultValue={levelOfRisks.find(
            option => option.value === levelOfRisk
          )}
        />
         <Select
          name="status"
          label="Status"
          options={statuses}
          innerRef={register({ required: true })}
          onChange={handleChange("status")}
          error={errors.status && errors.status.message}
          defaultValue={statuses.find(
            option => option.value === status
          )}
        />
        <Button type="submit" loading={submitting}>
          Submit
        </Button>
      </Form>
    </div>
  )
}

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  levelOfRisk: yup.string().required(),
  status: yup.string().required()
});

export interface RiskFormValues {
  name: string;
  levelOfRisk: LevelOfRisk;
  status: Status;
}

export interface RiskFormProps {
  onCancel?: () => void;
  onSubmit?: (data: RiskFormValues) => void;
  submitting?: boolean;
  defaultValues?: RiskFormValues;
}

export default RiskForm;