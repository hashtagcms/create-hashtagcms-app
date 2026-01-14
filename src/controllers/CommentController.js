const FrontendBaseController = require('./FrontendBaseController');

class CommentController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        // todo: handle comment posting
        return super.index(req, res);
    }
}
module.exports = CommentController;
