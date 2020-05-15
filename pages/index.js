import Link from 'next/link';
import { request } from 'graphql-request';
import { withRouter } from 'next/router';
import Layout from '../components/layout';

const fetcher = async (query) => {
  const res = await request('/api/graphql', query);
  return res;
};

const viewerQuery = `{
    viewer {
      id
      email
    }
  }`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
  }

  componentDidMount() {
    fetcher(viewerQuery)
      .then(({ viewer: { email } }) => {
        this.setState({
          email,
        });
      })
      .catch((error) => {
        if (error.message === 'No token found, please log in.') {
          console.info('Not logged in.');
        } else if (error.message === 'Authentication token is invalid, please log in.') {
          console.info('Bad token.');
        }

        this.props.router.push('/signin');
      });
  }

  render() {
    if (this.state.email) {
      return (
        <Layout>
          <main className="center">
            <Link href="/map/[id]" as="/map/1">
              <a>Go to a map</a>
            </Link>
          </main>
        </Layout>
      );
    }

    return <p>Loading...</p>;
  }
}

export default withRouter(Index);
