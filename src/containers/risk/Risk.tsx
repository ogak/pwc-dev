// import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { useRiskQuery, LevelOfRisk, Status } from "../../generated/graphql";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
// import { toast } from "react-toastify";
// import { oc } from "ts-optchain";
// import {
//   PoliciesDocument,
//   useDestroyPolicyMutation,
//   usePolicyQuery,
//   useUpdatePolicyMutation,
//   PolicyDocument
// } from "../../generated/graphql";
// import Button from "../../shared/components/Button";
// import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
// import PolicyForm, { PolicyFormValues } from "./components/RiskForm";
// import { Link } from "react-router-dom";
// import Table from "../../shared/components/Table";
// import { FaTrash } from "react-icons/fa";
// import Helmet from "react-helmet";

// const Policy = ({ match, history }: RouteComponentProps) => {
//   const id = get(match, "params.id", "");
//   const { loading, data } = usePolicyQuery({
//     variables: { id },
//     fetchPolicy: "network-only"
//   });
//   const [update, updateState] = useUpdatePolicyMutation({
//     onCompleted: () => toast.success("Update Success"),
//     onError: () => toast.error("Update Failed"),
//     refetchQueries: [
//       { query: PoliciesDocument, variables: { filter: {} } },
//       { query: PolicyDocument, variables: { id } }
//     ],
//     awaitRefetchQueries: true
//   });
//   const [destroy] = useDestroyPolicyMutation({
//     onCompleted: () => toast.success("Delete Success"),
//     onError: () => toast.error("Delete Failed"),
//     refetchQueries: [{ query: PolicyDocument, variables: { id } }],
//     awaitRefetchQueries: true
//   });
//   const [destroyMain, destroyState] = useDestroyPolicyMutation({
//     onCompleted: () => {
//       toast.success("Delete Success");
//       history.push("/policy");
//     },
//     onError: () => toast.error("Delete Failed"),
//     refetchQueries: [{ query: PoliciesDocument, variables: { filter: {} } }],
//     awaitRefetchQueries: true
//   });

//   function handleDeleteMain() {
//     destroyMain({ variables: { id } });
//   }

//   function handleDelete(id: string) {
//     destroy({ variables: { id } });
//   }

//   function handleUpdate(values: PolicyFormValues) {
//     update({
//       variables: {
//         input: {
//           id,
//           title: values.title,
//           policyCategoryId: values.policyCategoryId,
//           description: values.description
//         }
//       }
//     });
//   }

//   function handleUpdateSubPolicy(values: SubPolicyFormValues) {
//     update({
//       variables: {
//         input: {
//           id,
//           resourceIds: values.resourceIds,
//           itSystemIds: values.itSystemIds,
//           businessProcessIds: values.businessProcessIds,
//           description: values.description,
//           referenceIds: values.referenceIds
//         }
//       }
//     });
//   }

//   const title = oc(data).policy.title("");
//   const description = oc(data).policy.description("");
//   const policyCategoryId = oc(data).policy.policyCategory.id("");
//   const parentId = oc(data).policy.parentId("");
//   const children = oc(data).policy.children([]);
//   const isSubPolicy: boolean = !!oc(data).policy.ancestry();
//   const ancestry = oc(data).policy.ancestry("");
//   const referenceIds = oc(data)
//     .policy.references([])
//     .map(item => item.id);

//   const isMaximumLevel = ancestry.split("/").length === 5;

//   if (loading) return null;

//   return (
//     <div>
//       <Helmet>
//         <title>Policy - {title} - PricewaterhouseCoopers</title>
//       </Helmet>
//       <div className="d-flex justify-content-between">
//         <HeaderWithBackButton heading={`Policy ${title}`} />
//         <div className="d-flex">
//           {!isMaximumLevel && (
//             <Link to={`/policy/${id}/create-sub-policy`}>
//               <Button className="mr-2 pwc">+ Create Sub-Policy</Button>
//             </Link>
//           )}
//           <Button
//             onClick={handleDeleteMain}
//             loading={destroyState.loading}
//             color="danger"
//           >
//             Delete
//           </Button>
//         </div>
//       </div>
//       {isSubPolicy ? (
//         <SubPolicyForm
//           defaultValues={{
//             parentId,
//             title,
//             description,
//             referenceIds,
//             resourceIds: oc(data)
//               .policy.resources([])
//               .map(r => r.id),
//             itSystemIds: oc(data)
//               .policy.itSystems([])
//               .map(r => r.id),
//             businessProcessIds: oc(data)
//               .policy.businessProcesses([])
//               .map(r => r.id)
//           }}
//           onSubmit={handleUpdateSubPolicy}
//           submitting={updateState.loading}
//         />
//       ) : (
//         <PolicyForm
//           onSubmit={handleUpdate}
//           defaultValues={{ title, policyCategoryId, description }}
//           submitting={updateState.loading}
//           isSubPolicy={isSubPolicy}
//         />
//       )}
//       {children.length ? (
//         <>
//           <h5 className="mt-5">Sub policies</h5>
//           <Table>
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Description</th>
//                 <th>References</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {children.map(item => (
//                 <tr key={item.id}>
//                   <td>
//                     <Link to={`/policy/${item.id}`}>{item.title}</Link>
//                   </td>
//                   <td>
//                     <div
//                       dangerouslySetInnerHTML={{
//                         __html: item.description ? item.description : ""
//                       }}
//                     ></div>
//                   </td>
//                   <td>
//                     {oc(item)
//                       .references([])
//                       .map(ref => ref.name)
//                       .join(", ")}
//                   </td>
//                   <td>
//                     <FaTrash
//                       onClick={() => handleDelete(item.id)}
//                       className="clickable"
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </>
//       ) : null}
//     </div>
//   );
// };

// export default Policy;

const Risk = ({ match }: RouteComponentProps) => {

  const id = match.params && (match.params as any).id;
  const { data, loading } = useRiskQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const defaultValues: RiskFormValues = {
    name: oc(data).risk.name(""),
    levelOfRisk: oc(data).risk.levelOfRisk(LevelOfRisk.Low) as LevelOfRisk,
    status: oc(data).risk.status(Status.Draft) as Status,
  };

  return (
    <div>
      <HeaderWithBackButton heading="Risk" />
      <RiskForm
        defaultValues={defaultValues}
        // onSubmit={handleSubmit}
        // submitting={updateResourceM.loading}
      />
    </div>
  )
}

export default Risk;
