import React from "react";
import { useForm } from "react-hook-form";
import { FaUndo } from "react-icons/fa";
import { Form, FormGroup, Input as ReactstrapInput, Label } from "reactstrap";
import Button from "../../../shared/components/Button";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import Tooltip from "../../../shared/components/Tooltip";
import {
  useLoadControls,
  useLoadResources,
  useLoadRisks,
  useLoadPolicyReferences,
} from "../../../shared/hooks/suggestions";
import { useLoadPolicyCategories } from "../../user/components/UserForm";
import { Suggestions } from "../../../shared/formatter";

export interface PolicySearchFormValues {
  title?: string;
  description?: string;
  risks?: Suggestions;
  controls?: Suggestions;
  resources?: Suggestions;
  policyCategories?: Suggestions;
  policyReferences?: Suggestions;
  dateFrom?: DateFilter;
}

interface PolicySearchFormProps {
  onSubmit: (data: PolicySearchFormValues) => void;
  submitting?: boolean;
  defaultValues?: PolicySearchFormValues;
}

const dateFilters = [
  "All Time",
  "Today",
  "In 7 days",
  "In a month",
  "In 90 days",
  "In a year",
] as const;

export type DateFilter = typeof dateFilters[number];

export default function PolicySearchForm({
  onSubmit,
  submitting,
  defaultValues,
}: PolicySearchFormProps) {
  const { register, setValue, handleSubmit } = useForm<PolicySearchFormValues>({
    defaultValues: defaultValues || { dateFrom: "All Time" },
  });
  const loadRisks = useLoadRisks();
  const loadControls = useLoadControls();
  const loadResources = useLoadResources();
  const loadPolicyCategories = useLoadPolicyCategories();
  const loadPolicyReferences = useLoadPolicyReferences();
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mx-3">
      <Input innerRef={register} name="title" placeholder="By Title..." />
      <Input
        innerRef={register}
        name="description"
        placeholder="By Description..."
      />
      <AsyncSelect
        name="risks"
        closeMenuOnSelect={true}
        register={register}
        setValue={setValue}
        loadOptions={loadRisks}
        defaultOptions
        isMulti
        placeholder="By Risks..."
      />
      <AsyncSelect
        name="controls"
        closeMenuOnSelect={true}
        register={register}
        setValue={setValue}
        loadOptions={loadControls}
        defaultOptions
        isMulti
        placeholder="By Controls..."
      />
      <AsyncSelect
        name="resources"
        closeMenuOnSelect={true}
        register={register}
        setValue={setValue}
        loadOptions={loadResources}
        defaultOptions
        isMulti
        placeholder="By Resources..."
      />
      <AsyncSelect
        name="policyCategories"
        closeMenuOnSelect={true}
        register={register}
        setValue={setValue}
        loadOptions={loadPolicyCategories}
        defaultOptions
        isMulti
        placeholder="By Categories..."
      />
      <AsyncSelect
        name="policyReferences"
        closeMenuOnSelect={true}
        register={register}
        setValue={setValue}
        loadOptions={loadPolicyReferences}
        defaultOptions
        isMulti
        placeholder="By References..."
      />
      <Label>Last updated in:</Label>
      <FormGroup tag="fieldset">
        {dateFilters.map((item) => (
          <FormGroup key={item} check>
            <Label check>
              <ReactstrapInput
                type="radio"
                name="dateFrom"
                value={item}
                defaultChecked={item === "All Time"}
                innerRef={register}
              />
              &nbsp;{item}
            </Label>
          </FormGroup>
        ))}
      </FormGroup>
      <div className="d-flex justify-content-end">
        <Tooltip description="Reset Search">
          <Button type="reset" className="soft red" color="">
            <FaUndo />
          </Button>
        </Tooltip>
        <Button
          loading={submitting}
          type="submit"
          className="pwc ml-2"
          color="primary"
        >
          Search
        </Button>
      </div>
    </Form>
  );
}
