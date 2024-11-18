import { format } from 'date-fns';

const logger = (req, res, next) => {
  console.log(
    `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} [${req.method}] ${req.url}`
  );
  next();
};

export default logger;