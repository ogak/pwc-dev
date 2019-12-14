import React from "react";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { RouteComponentProps } from "react-router";
import { useCreatePolicyMutation } from "../../generated/graphql";
import { oc } from "ts-optchain";
import { toast } from "react-toastify";
import Helmet from "react-helmet";

const CreatePolicy = ({ history }: RouteComponentProps) => {
  const [createPolicy, { loading }] = useCreatePolicyMutation({
    onCompleted: res => {
      toast.success("Create Success");
      const id = oc(res).createPolicy.policy.id("");
      history.replace(`/policy/${id}`);
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["policies"],
    awaitRefetchQueries: true
  });
  function handleSubmit(values: PolicyFormValues) {
    createPolicy({
      variables: {
        input: {
          title: values.title,
          policyCategoryId: values.policyCategoryId,
          description: values.description,
          status: values.status
        }
      }
    });
  }
  return (
    <div>
      <Helmet>
        <title>Create Policy - PricewaterhouseCoopers</title>
      </Helmet>
      <HeaderWithBackButton heading="Create Policy" />
      <PolicyForm onSubmit={handleSubmit} submitting={loading} />
    </div>
  );
};

export default CreatePolicy;
