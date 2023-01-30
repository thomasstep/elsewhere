import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

// import { makeStyles } from '@mui/styles';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

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
  newEntryFormView,
  mapView,
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

function Trip() {
  const router = useRouter();
  // id is the user's ID; only dictates layout links
  const [id, setId] = useState('');
  // entries is an array of entry objects; shape determined by API
  const [entries, setEntries] = useState([]);
  // Represents which data view to show: a map of entries, a schedule with entries
  const [activeDataView, setActiveDataView] = useState(mapView);
  // Represents which form view to show: creating a new entry, active entry information
  const [activeFormView, setActiveFormView] = useState(newEntryFormView);
  // activeEntry is the data of the actively selected entry
  const [activeEntry, setActiveEntry] = useState({});
  // newEntryData is the data that will be sent for a new entry being created
  const [newEntryData, setNewEntryData] = useState({});

  useEffect(() => {
    const token = getCookie(jwtCookieName);

    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
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
        console.log(data)
      })
      .catch((err) => {
        // TODO handle error
      })
  }, []);

  if (id) {
    return (
      <Layout session={id}>

        <Wrapper apiKey={googleMapsKey} render={loadingRender}>
          <MapView
            entries={entries}
            activeEntry={activeEntry}
            setActiveEntry={setActiveEntry}
            newEntryData={newEntryData}
            setNewEntryData={setNewEntryData}
          />
        </Wrapper>

        <ScheduleView
          entries={entries}
          activeEntry={activeEntry}
          setActiveEntry={setActiveEntry}
          newEntryData={newEntryData}
          setNewEntryData={setNewEntryData}
        />

        {/* TODO check that the active entry is not empty; otherwise, don't allow this view */}
        <EntryInfo
          entries={entries}
          setEntries={setEntries}
          activeEntry={activeEntry}
          setActiveEntry={setActiveEntry}
        />

        <NewEntryForm
          entries={entries}
          setEntries={setEntries}
          newEntryData={newEntryData}
          setNewEntryData={setNewEntryData}
        />

      </Layout>
    );
  }

  return <LoadingPage />;
}

export default Trip;
