import CatchAllPage, { getCatchAllServerSideProps } from '../src/next/catch-all-page';

export default CatchAllPage;

export async function getServerSideProps(context) {
  return getCatchAllServerSideProps(context);
}
