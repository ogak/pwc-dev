import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { useState } from "react";
import {
  FaBookmark,
  FaEllipsisV,
  FaEye,
  FaEyeSlash,
  FaFilePdf
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { Badge, Table } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useBusinessProcessQuery,
  useCreateBookmarkBusinessProcessMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu from "../../shared/components/Menu";
import ResourceBar from "../../shared/components/ResourceBar";
import {
  downloadPdf,
  previewPdf,
  emailPdf
} from "../../shared/utils/accessGeneratedPdf";
import { MdEmail } from "react-icons/md";

const RiskAndControls = ({ match, history }: RouteComponentProps) => {
  const initialCollapse = ["Resources", "Risks", "Controls", "Sub-Policies"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse(p => {
      if (p.includes(name)) {
        return p.filter(item => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const [addBookmark] = useCreateBookmarkBusinessProcessMutation({
    onCompleted: () => toast.success("Added to Bookmark"),
    onError: () => toast.error("Failed to add")
  });

  const name = oc(data).businessProcess.name("");
  const risks = oc(data).businessProcess.risks([]);
  const resources = oc(data).businessProcess.resources([]);

  if (loading) return <LoadingSpinner size={30} centered />;

  const renderActions = () => {
    return (
      <div className="d-flex align-items-center">
        <Button
          className="ml-3"
          color="transparent"
          onClick={() => {
            collapse.length === initialCollapse.length
              ? closeAllCollapse()
              : openAllCollapse();
          }}
        >
          {collapse.length === initialCollapse.length ? (
            <FaEyeSlash size={20} />
          ) : (
            <FaEye size={20} />
          )}
        </Button>
        <Menu
          data={[
            {
              label: (
                <div>
                  <FaFilePdf /> Preview
                </div>
              ),
              onClick: () =>
                previewPdf(`prints/${id}/business_process.pdf`, {
                  onStart: () =>
                    toast.info("Downloading file for preview", {
                      autoClose: 10000
                    })
                })
            },
            {
              label: (
                <div>
                  <IoMdDownload /> Download
                </div>
              ),
              onClick: () =>
                downloadPdf(`prints/${id}/business_process.pdf`, {
                  fileName: name,
                  onStart: () => toast.info("Download Started"),
                  onError: () => toast.error("Download Failed"),
                  onCompleted: () => toast.success("Download Success")
                })
            },
            {
              label: (
                <div>
                  <FaBookmark /> Bookmark
                </div>
              ),
              onClick: () => addBookmark({ variables: { id } })
            },
            {
              label: (
                <div>
                  <MdEmail /> Mail
                </div>
              ),
              onClick: () => emailPdf(name)
            }
          ]}
        >
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderActions()}
      </div>
      <Collapsible
        title="Risks"
        show={collapse.includes("Risks")}
        onClick={toggleCollapse}
      >
        {risks.length ? (
          <ul>
            {risks.map(risk => (
              <li key={risk.id}>
                <div className="mb-3 d-flex">
                  <h5>
                    {risk.name}{" "}
                    <Badge color="danger mx-3">
                      {capitalCase(risk.levelOfRisk || "")}
                    </Badge>
                    <Badge color="danger">
                      {capitalCase(risk.typeOfRisk || "")}
                    </Badge>
                  </h5>
                </div>

                <Table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Freq</th>
                      <th>Type of Control</th>
                      <th>Nature</th>
                      <th>IPO</th>
                      <th>Assertion</th>
                      <th>Control Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risk.controls.length ? (
                      risk.controls.map(control => (
                        <tr key={control.id}>
                          <td>{control.description}</td>
                          <td>{capitalCase(control.frequency || "")}</td>
                          <td>{capitalCase(control.typeOfControl || "")}</td>
                          <td>{capitalCase(control.nature || "")}</td>
                          <td>
                            {oc(control)
                              .ipo([])
                              .map(a => capitalCase(a))
                              .join(", ")}
                          </td>
                          <td>
                            {oc(control)
                              .assertion([])
                              .map(a => capitalCase(a))
                              .join(", ")}
                          </td>
                          <td>{control.controlOwner}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <EmptyAttribute />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>
      <Collapsible
        title="Resources"
        show={collapse.includes("Resources")}
        onClick={toggleCollapse}
      >
        {resources.length ? (
          resources.map(resource => {
            return <ResourceBar key={resource.id} {...resource} />;
          })
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>
    </div>
  );
};

export default RiskAndControls;
