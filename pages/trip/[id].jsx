import { useRouter } from 'next/router';
import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

// import { makeStyles } from '@mui/styles';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import Layout from '../../components/layout';
import LoadingPage from '../../components/loadingPage';
import EntryInfo from '../../components/entryInfo';
import MapView from '../../components/mapView';
import NewEntryForm from '../../components/newEntryForm';
import ScheduleView from '../../components/scheduleView';
import {
  elsewhereApiUrl,
  authenticationServiceUrl,
  applicationId,
  jwtCookieName,
  googleMapsKey,
  mapView,
  scheduleView,
  activeEntryFormView,
  newEntryFormView,
  debug,
} from '../../utils/config';
import {
  getCookie,
} from '../../utils/util';

const loadingRender = (status) => {
  switch (status) {
    case Status.LOADING:
      return <LoadingPage />;
    case Status.FAILURE:
      return <LoadingPage />;
    // return <ErrorComponent />;
    case Status.SUCCESS:
      return <LoadingPage />;
    // return <MyMapComponent />;
    default:
      return <LoadingPage />;
  }
};


function TabPanel(props) {
  const {
    children,
    value,
    index,
    ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

TabPanel.defaultProps = {
  children: null,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function Trip() {
  const router = useRouter();
  // id is the user's ID; only dictates layout links
  const [id, setId] = useState('');
  // entries is an array of entry objects; shape determined by API
  const [entries, setEntries] = useState([]);
  // Represents which data view to show: a map of entries, a schedule with entries
  // const [activeDataView, setActiveDataView] = useState(mapView);
  // Represents which form view to show: creating a new entry, active entry information
  // const [activeFormView, setActiveFormView] = useState(newEntryFormView);
  // activeEntry is the data of the actively selected entry
  const [activeEntry, setActiveEntry] = useState({});
  // newEntryData is the data that will be sent for a new entry being created
  const [newEntryData, setNewEntryData] = useState({});
  // token is the auth token held in a cookie
  const [token, setToken] = useState(null);
  // Controls the tabs
  const [activeTab, setActiveTab] = useState(0);

  if (debug) {
    console.group('STATE UPDATE');
    console.log(entries);
    console.log(activeEntry);
    console.log(newEntryData);
    console.groupEnd();
  }

  useEffect(() => {
    const cookieToken = getCookie(jwtCookieName);
    setToken(cookieToken);
  }, []);

  useEffect(() => {
    if (!token || !router.isReady) {
      return;
    }

    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) router.push('/signin');
        if (res.status === 403) router.push('/signin');
        if (res.status !== 200) router.push('/signin');

        return res.json();
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {
        router.push('/signin');
      });

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200) throw new Error('Unhandled status code');

        return res.json();
      })
      .then((data) => {
        setEntries(data);
      })
      .catch((err) => {
        // TODO handle error
        console.error(err);
      });
  }, [router, token]);

  async function createEntry() {
    if (!router) {
      return false;
    }

    const res = await fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEntryData),
    });

    if (res.status !== 200) {
      return false;
    }

    const data = res.json();
    return data;
  }

  const createEntryCallback = useCallback(() => createEntry());

  async function updateEntry() {
    if (!router) {
      return false;
    }

    // Build request data
    const entryData = { location: {} };
    if (activeEntry.name !== '') entryData.name = activeEntry.name;
    if (activeEntry.startTimestamp !== '') entryData.startTimestamp = activeEntry.startTimestamp;
    if (activeEntry.endTimestamp !== '') entryData.endTimestamp = activeEntry.endTimestamp;
    if (activeEntry.notes !== '') entryData.notes = activeEntry.notes;
    if (activeEntry.location.latitude) {
      entryData.location.latitude = activeEntry.location.latitude;
    }

    if (activeEntry.location.longitude) {
      entryData.location.longitude = activeEntry.location.longitude;
    }
    if (activeEntry.location.address !== '') entryData.location.address = activeEntry.location.address;

    const res = await fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry/${activeEntry.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entryData),
    });

    if (res.status !== 200) {
      return false;
    }

    const data = res.json();
    return data;
  }

  const updateEntryCallback = useCallback(() => updateEntry());

  async function deleteEntry() {
    if (!router) {
      return false;
    }

    const res = await fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry/${activeEntry.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 204) {
      return false;
    }

    return true;
  }

  const deleteEntryCallback = useCallback(() => deleteEntry());

  function changeTab(view) {
    switch (view) {
      case (mapView):
        setActiveTab(0);
        break;
      case (scheduleView):
        setActiveTab(1);
        break;
      case (activeEntryFormView):
        setActiveTab(2);
        break;
      case (newEntryFormView):
        setActiveTab(3);
        break;
      default:
        break;
    }
  }

  const changeTabCallback = useCallback((view) => {
    changeTab(view);
  });

  if (id) {
    return (
      <Layout session={id}>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newVal) => {
              setActiveTab(newVal);
            }}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
          >
            <Tab label="Map" {...a11yProps(0)} />
            <Tab label="Schedule" {...a11yProps(1)} />
            <Tab label="Selected Entry" {...a11yProps(2)} />
            <Tab label="New Entry" {...a11yProps(3)} />
          </Tabs>
        </Box>


        <TabPanel value={activeTab} index={0}>
          <Wrapper apiKey={googleMapsKey} render={loadingRender}>
            <MapView
              entries={entries}
              activeEntry={activeEntry}
              setActiveEntry={setActiveEntry}
              newEntryData={newEntryData}
              setNewEntryData={setNewEntryData}
              changeTab={changeTabCallback}
            />
          </Wrapper>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ScheduleView
            entries={entries}
            activeEntry={activeEntry}
            setActiveEntry={setActiveEntry}
            newEntryData={newEntryData}
            setNewEntryData={setNewEntryData}
            changeTab={changeTabCallback}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* TODO check that the active entry is not empty; otherwise, don't allow this view */}
          <EntryInfo
            entries={entries}
            setEntries={setEntries}
            activeEntry={activeEntry}
            setActiveEntry={setActiveEntry}
            updateEntry={updateEntryCallback}
            deleteEntry={deleteEntryCallback}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <NewEntryForm
            entries={entries}
            setEntries={setEntries}
            newEntryData={newEntryData}
            setNewEntryData={setNewEntryData}
            createEntry={createEntryCallback}
          />
        </TabPanel>

      </Layout>
    );
  }

  return <LoadingPage />;
}

export default Trip;
