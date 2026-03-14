"use client";

import { Admin, Resource, Layout, AppBar, Menu, MenuItemLink } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import { BarChart } from "lucide-react";
import Link from "next/link";

import { CourseList } from "./course/list";
import { CourseEdit } from "./course/edit";
import { CourseCreate } from "./course/create";

import { UnitList } from "./unit/list";
import { UnitEdit } from "./unit/edit";
import { UnitCreate } from "./unit/create";

import { LessonList } from "./lesson/list";
import { LessonEdit } from "./lesson/edit";
import { LessonCreate } from "./lesson/create";

import { ChallengeList } from "./challenge/list";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeCreate } from "./challenge/create";

import { ChallengeOptionList } from "./challengeOption/list";
import { ChallengeOptionEdit } from "./challengeOption/edit";
import { ChallengeOptionCreate } from "./challengeOption/create";

const dataProvider = simpleRestProvider("/api");

// Custom Menu with Analytics link
const CustomMenu = () => (
  <Menu>
    <MenuItemLink
      to="/admin/analytics"
      primaryText="Analytics"
      leftIcon={<BarChart />}
    />
  </Menu>
);

// Custom Layout using the custom menu
const CustomLayout = (props: React.ComponentProps<typeof Layout>) => (
  <Layout {...props} menu={CustomMenu} />
);

const App = () => {
  return (
    <Admin dataProvider={dataProvider} layout={CustomLayout}>
      <Resource
        name="courses"
        list={CourseList}
        create={CourseCreate}
        edit={CourseEdit}
        recordRepresentation="title"
      />
      <Resource
        name="units"
        list={UnitList}
        create={UnitCreate}
        edit={UnitEdit}
        recordRepresentation="title"
      />
      <Resource
        name="lessons"
        list={LessonList}
        create={LessonCreate}
        edit={LessonEdit}
        recordRepresentation="title"
      />
      <Resource
        name="challenges"
        list={ChallengeList}
        create={ChallengeCreate}
        edit={ChallengeEdit}
        recordRepresentation="question"
      />
      <Resource
        name="challengeOptions"
        list={ChallengeOptionList}
        create={ChallengeOptionCreate}
        edit={ChallengeOptionEdit}
        recordRepresentation="text"
        options={{ label: "Challenge Options" }}
      />
    </Admin>
  );
};

export default App;
