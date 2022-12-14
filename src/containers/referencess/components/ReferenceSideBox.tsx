import React, { useState, useEffect } from "react";
import { oc } from "ts-optchain";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox,
} from "../../../shared/components/SideBox";
// import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { useReferencesQuery } from "../../../generated/graphql";
import PickIcon from "../../../assets/Icons/PickIcon";

const ReferenceSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if ((scroll === 0 || scroll < 0) && condition) {
      setLimit(limit + 25);
    }
  };
  const { data, loading } = useReferencesQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: search }, limit },
  });
  const [condition, setCondition] = useState(false);

  useEffect(() => {
    data?.navigatorReferences?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const references = oc(data).navigatorReferences.collection([]);

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {/* {isAdmin || isAdminReviewer || isAdminPreparer */}
            {/* ?  */}
            Policy Reference Administrative
            {/* : "Policy reference"} */}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search policy reference..."
        loading={loading}
      />
      {references.map((reference) => {
        return (
          <SideBoxItem
            key={reference.id}
            to={`/references/${reference.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(reference).name("")
                ? oc(reference).name("")?.length > 60
                  ? oc(reference)
                      .name("")
                      ?.substring(0, 60) + "..."
                  : oc(reference).name("")
                : null}
            </SideBoxItemText>
            {/* <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(oc(reference).updatedAt(""))}
            </SideBoxItemText> */}
          </SideBoxItem>
        );
      })}
      {!(references.length < limit) && !loading && (
        <div className="text-center mt-2">
          <Tooltip description="refresh">
            <Button
              className="soft red "
              color=""
              onClick={() => setLimit(limit + 25)}
            >
              <PickIcon name="reloadOrange" />
            </Button>
          </Tooltip>
        </div>
      )}
      {loading && (
        <div>
          <LoadingSpinner className="mt-2 mb-2" centered biggerSize />
        </div>
      )}
    </SideBox>
  );
};

export default ReferenceSideBox;
