import useLazyQueryReturnPromise from "./useLazyQueryReturnPromise";
import {
  EnumListsQuery,
  EnumListsDocument,
  PoliciesQuery,
  PoliciesDocument,
  ControlsQuery,
  ControlsDocument,
  RisksQuery,
  RisksDocument,
  ResourcesQuery,
  ResourcesDocument,
  ReferencesDocument,
  ReferencesQuery,
  DepartmentsQuery,
  DepartmentsDocument,
} from "../../generated/graphql";
import { Suggestions, toLabelValue } from "../formatter";

export function useLoadPolicies() {
  const query = useLazyQueryReturnPromise<PoliciesQuery>(PoliciesDocument);
  async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { title_cont },
      });
      return data.policies?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

export function useLoadControls() {
  const query = useLazyQueryReturnPromise<ControlsQuery>(ControlsDocument);
  async function getSuggestions(
    description_cont: string = ""
  ): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { description_cont },
      });
      return (
        data.navigatorControls?.collection
          ?.map(({ description, id }) => ({ id, name: description }))
          .map(toLabelValue) || []
      );
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

export function useLoadRisks() {
  const query = useLazyQueryReturnPromise<RisksQuery>(RisksDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont },
      });
      return data.navigatorRisks?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

export function useLoadResources() {
  const query = useLazyQueryReturnPromise<ResourcesQuery>(ResourcesDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont },
      });
      return data.navigatorResources?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

export function useLoadPolicyReferences() {
  const query = useLazyQueryReturnPromise<ReferencesQuery>(ReferencesDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont },
      });
      return data.navigatorReferences?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

// ********** WARNING: THIS IS NOT POLICY CATEGORY
export function useLoadCategories() {
  const query = useLazyQueryReturnPromise<EnumListsQuery>(EnumListsDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont, category_type_eq: "Category" },
      });
      return data.enumLists?.collection.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
export function useLoadDepartmentUser() {
  const query = useLazyQueryReturnPromise<DepartmentsQuery>(
    DepartmentsDocument
  );
  async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({ filter: { title_cont } });
      return data.departments?.collection.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
export function useLoadDepartments() {
  // const query = useLazyQueryReturnPromise<PoliciesQuery>(PoliciesDocument);
  // async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
  //   try {
  //     const { data } = await query({
  //       filter: { title_cont },
  //     });
  //     return data.policies?.collection?.map(toLabelValue) || [];
  //   } catch (error) {
  //     return [];
  //   }
  // }
  // return getSuggestions;
}
