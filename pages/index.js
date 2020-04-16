import Layout from '../components/layout';
import Link from 'next/link'

export default function Index() {
  return (
    <Layout>
      <main className="center">
        <Link href='/map/[id]' as='/map/1'>Go to a map</Link>
      </main>
    </Layout>
  );
}
