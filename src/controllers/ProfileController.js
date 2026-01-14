const FrontendBaseController = require('./FrontendBaseController');

class ProfileController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        // todo: handle profile updates
        return super.index(req, res);
    }
}
module.exports = ProfileController;
