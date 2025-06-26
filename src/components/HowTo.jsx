import Sector from "./Sector";
import { useTranslation } from "react-i18next";

const HowTo = () => {
  const { t } = useTranslation("howTo");
  return (
    <div className="h-screen">
      <Sector title={t("title")} />
    </div>
  );
};

export default HowTo;
