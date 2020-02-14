import React from "react";
import useForm from "react-hook-form";
import { useDispatch } from "react-redux";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  UpdateUserInput,
  User,
  useUpdateProfileMutation,
  useUpdateUserPasswordMutation
} from "../../generated/graphql";
import { updateUser } from "../../redux/auth";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import { useSelector } from "../../shared/hooks/useSelector";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";

const UpdateProfile = () => {
  const user = useSelector(state => state.auth.user);
  const defaultValues = user || {};
  const dispatch = useDispatch();

  // Handler for update user information
  const [updateProfileM, { loading }] = useUpdateProfileMutation({
    onCompleted: res => {
      notifySuccess("Update Success");
      const newUser = {
        id: oc(res).updateUser.user.id(""),
        email: oc(res).updateUser.user.email(""),
        firstName: oc(res).updateUser.user.firstName(""),
        lastName: oc(res).updateUser.user.lastName(""),
        name: oc(res).updateUser.user.name(""),
        phone: oc(res).updateUser.user.phone(""),
        jobPosition: oc(res).updateUser.user.jobPosition(""),
        department: oc(res).updateUser.user.department("")
      };
      if (user) dispatch(updateUser(newUser));
    },
    onError: notifyGraphQLErrors
  });
  function updateProfile(values: UpdateUserInput) {
    updateProfileM({ variables: { input: values } });
  }

  // Handler for update user password
  const [
    updateUserPasswordM,
    updateUserPasswordMutInfo
  ] = useUpdateUserPasswordMutation({
    onCompleted: () => notifySuccess("Password Updated"),
    onError: notifyGraphQLErrors
  });
  function updateUserPassword(values: UpdatePasswordFormValues) {
    updateUserPasswordM({ variables: { input: values } });
  }

  if (!oc(user).email("")) {
    return <h3>You are not signed in</h3>;
  }

  return (
    <div>
      <UpdateProfileForm
        onSubmit={updateProfile}
        submitting={loading}
        defaultValues={defaultValues}
      />
      <UpdatePasswordForm
        onSubmit={updateUserPassword}
        submitting={updateUserPasswordMutInfo.loading}
      />
    </div>
  );
};

export default UpdateProfile;

// ============================================
// Building Blocks => Update profile form
// ============================================

const UpdateProfileForm = ({
  onSubmit,
  submitting,
  defaultValues
}: UpdateProfileFormProps) => {
  const { register, handleSubmit, errors } = useForm<UpdateUserInput>({
    defaultValues
  });
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h4>Profile</h4>
      <Input
        name="name"
        label="First name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <Input
        name="jobPosition"
        label="Position"
        innerRef={register({ required: true })}
        error={errors.jobPosition && errors.jobPosition.message}
      />
      <Input
        name="email"
        label="Email"
        innerRef={register({ required: true })}
        error={errors.email && errors.email.message}
      />
      <Input
        name="phone"
        label="Phone number"
        innerRef={register({ required: true })}
        error={errors.phone && errors.phone.message}
      />
      <div className="d-flex justify-content-end">
        <Button type="submit" loading={submitting} className="soft orange">
          Save Profile
        </Button>
      </div>
    </Form>
  );
};

interface UpdateProfileFormProps {
  onSubmit: (values: UpdateUserInput) => void;
  submitting?: boolean;
  defaultValues?: User | {};
}

// ============================================
// Building Blocks => Update password form
// ============================================

const UpdatePasswordForm = ({
  onSubmit,
  submitting
}: UpdatePasswordFormProps) => {
  const { register, handleSubmit, errors, reset } = useForm<
    UpdatePasswordFormValues
  >();
  const submit = (data: UpdatePasswordFormValues) => {
    onSubmit(data);
    reset({
      password: "",
      passwordConfirmation: ""
    });
  };
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <h4>Update Password</h4>
      <Input
        name="password"
        label="New Password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
        required
      />
      <Input
        name="passwordConfirmation"
        label="New Password Confirmation"
        type="password"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
        required
      />
      <div className="d-flex justify-content-end">
        <Button
          className="soft orange"
          type="submit"
          color=""
          loading={submitting}
        >
          Update Password
        </Button>
      </div>
    </Form>
  );
};

interface UpdatePasswordFormProps {
  onSubmit: (values: UpdatePasswordFormValues) => void;
  submitting?: boolean;
}

interface UpdatePasswordFormValues {
  password: string;
  passwordConfirmation: string;
}
