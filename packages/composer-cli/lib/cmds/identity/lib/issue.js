/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const cmdUtil = require('../../utils/cmdutils');
const Create = require('../../card/lib/create');

/**
 * <p>
 * Composer "identity issue" command
 * </p>
 * <p><a href="diagrams/Deploy.svg"><img src="diagrams/deploy.svg" style="width:100%;"/></a></p>
 * @private
 */
class IssueCard {

  /**
    * Command process for deploy command
    * @param {string} argv argument list from composer command
    * @return {Promise} promise when command complete
    */
    static handler(argv) {
        let businessNetworkConnection;
        let issuingCard;
        let cardName = argv.card;
        let newUserId = argv.newUserId;
        let participantId = argv.participantId;
        let issuer = !!argv.issuer;

        return Promise.resolve()
            .then(() => {

                return cmdUtil.createAdminConnection().exportCard(cardName);
            })
            .then((result) =>{
                issuingCard = result;
                businessNetworkConnection = cmdUtil.createBusinessNetworkConnection();
                return businessNetworkConnection.connect(cardName);
            })
            .then(() => {
                let issueOptions = cmdUtil.parseOptions(argv);
                issueOptions.issuer = issuer;
                return businessNetworkConnection.issueIdentity(participantId, newUserId, issueOptions);
            })
            .then((result) => {
                let metadata= {
                    userName : result.userID,
                    version : 1,
                    enrollmentSecret: result.userSecret,
                    businessNetwork : issuingCard.getBusinessNetworkName()
                };

                // re-use the logic in the create command to create the id card
                return Create.createCard(metadata,issuingCard.getConnectionProfile(),argv);
            });
    }

}

module.exports = IssueCard;
