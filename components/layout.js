import Header from './header';

const layoutStyle = {
  width: '100%',
  height: '100%',
};

const Layout = (props) => (
  <div style={layoutStyle}>
    <Header />
    {props.children}
    <style jsx global>{`
      body {
        margin: 0;
    `}</style>
  </div>
);

export default Layout;
