-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "cryptoAssetsVolumes" TEXT[],
ADD COLUMN     "energiesAssetsVolumes" TEXT[],
ADD COLUMN     "forexAssetsVolumes" TEXT[],
ADD COLUMN     "indicesAssetsVolumes" TEXT[],
ADD COLUMN     "metalsAssetsVolumes" TEXT[];
