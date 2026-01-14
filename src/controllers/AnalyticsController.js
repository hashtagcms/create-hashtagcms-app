const FrontendBaseController = require('./FrontendBaseController');

class AnalyticsController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        return super.index(req, res);
    }
}
module.exports = AnalyticsController;
